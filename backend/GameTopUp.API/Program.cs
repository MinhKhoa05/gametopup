using GameTopUp.Api.Extensions;
using GameTopUp.Api.Filters;
using GameTopUp.Api.Middlewares;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.ApplyEnvironmentOverrides();

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
    options.SwaggerDoc("v1", new() { Title = "GameTopUp Rebuild API", Version = "v1" });
});

builder.Services.AddGameTopUpOptions(builder.Configuration);
builder.Services.AddGameTopUpCors(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddGameTopUpDatabase();
builder.Services.AddRepositories();
builder.Services.AddBusinessServices();
builder.Services.AddUseCases();
builder.Services.AddCommonServices();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(ServiceCollectionExtensions.ReactAppCorsPolicy);
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
