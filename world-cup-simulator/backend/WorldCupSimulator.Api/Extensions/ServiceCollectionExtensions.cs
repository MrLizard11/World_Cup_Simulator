using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.Services;

namespace WorldCupSimulator.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            var corsOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
            options.AddPolicy("AllowAngular",
                builder => 
                {
                    builder
                        .WithOrigins(corsOrigins ?? Array.Empty<string>())
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });
        });

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IGroupService, GroupService>();
        services.AddScoped<ITeamService, TeamService>();
        services.AddScoped<IMatchService, MatchService>();
        services.AddScoped<ISimulationService, SimulationService>();

        return services;
    }

    public static IServiceCollection AddSwaggerDoc(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo 
            { 
                Title = "World Cup Simulator API", 
                Version = "v1",
                Description = "API for managing World Cup tournament simulations"
            });
        });

        return services;
    }

    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<WorldCupContext>(options =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.EnableRetryOnFailure()
            );
        });

        return services;
    }

    public static IServiceCollection AddJsonOptions(this IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                // Handle circular references in JSON serialization
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

        return services;
    }
}
