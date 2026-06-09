using Microsoft.AspNetCore.Mvc;
using GameTopUp.API.Extensions;
using GameTopUp.API.Filters;
using GameTopUp.API.Middlewares;
using GameTopUp.BLL.Config;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.ApplyEnvironmentOverrides();

// Add services to the container
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "GameTopup API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập JWT Access Token"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddGameTopUpOptions(builder.Configuration);
builder.Services.AddGameTopUpCors(builder.Configuration);

// JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services
    .AddGameTopUpDatabase()
    .AddRepositories()
    .AddBusinessServices()
    .AddUseCases()
    .AddCommonServices();

builder.Services.AddHttpContextAccessor();

// ================= MAPSTER =================
MapsterConfig.RegisterMappings();

var app = builder.Build();

// ================= MIDDLEWARE =================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(ServiceCollectionExtensions.ReactAppCorsPolicy);
app.UseStaticFiles();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
public partial class Program { }
