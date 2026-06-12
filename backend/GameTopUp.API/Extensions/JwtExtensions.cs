using System.Text;
using GameTopUp.Api;
using GameTopUp.Api.Middlewares;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace GameTopUp.Api.Extensions;

public static class JwtExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>();

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = GetTokenValidationParameters(jwtSettings!);
                options.Events = GetJwtBearerEvents();
            });

        return services;
    }

    private static TokenValidationParameters GetTokenValidationParameters(JwtSettings jwtSettings)
    {
        return new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ClockSkew = TimeSpan.Zero
        };
    }

    private static JwtBearerEvents GetJwtBearerEvents()
    {
        return new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Cookies["accessToken"];
                if (!string.IsNullOrEmpty(token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            },
            OnChallenge = async context =>
            {
                context.HandleResponse();
                await WriteErrorResponse(context.HttpContext, StatusCodes.Status401Unauthorized, ErrorCode.Unauthorized);
            },
            OnAuthenticationFailed = async context =>
            {
                await WriteErrorResponse(context.HttpContext, StatusCodes.Status401Unauthorized, ErrorCode.Unauthorized);
            },
            OnForbidden = async context =>
            {
                await WriteErrorResponse(context.HttpContext, StatusCodes.Status403Forbidden, ErrorCode.Forbidden);
            }
        };
    }

    private static async Task WriteErrorResponse(HttpContext context, int statusCode, ErrorCode errorCode)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        var response = ApiResponse.Fail(errorCode);
        await context.Response.WriteAsJsonAsync(response);
    }
}
