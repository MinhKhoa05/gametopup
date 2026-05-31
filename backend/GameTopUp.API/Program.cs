using Microsoft.AspNetCore.Mvc;
using dotenv.net;
using GameTopUp.API.Extensions;
using GameTopUp.API.Filters;
using GameTopUp.API.Middlewares;
using GameTopUp.BLL.Config;

// Load .env file
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
if (!File.Exists(envPath)) envPath = ".env"; // Try current dir for Docker
DotEnv.Load(new DotEnvOptions(envFilePaths: new[] { envPath }));

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.ApplyEnvironmentOverrides();

// ================= CORS CONFIGURATION =================
var originFromConfig = builder.Configuration["AllowedOrigins"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins(originFromConfig ?? "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

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

// JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services
    .AddGameTopUpDatabase()
    .AddRepositories()
    .AddBusinessServices()
    .AddUseCases()
    .AddExternalServices();

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

app.UseCors("AllowReactApp");
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
public partial class Program { }
