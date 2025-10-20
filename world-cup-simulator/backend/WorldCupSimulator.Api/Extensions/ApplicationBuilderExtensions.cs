using WorldCupSimulator.Api.Data;

namespace WorldCupSimulator.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static WebApplication ConfigureMiddleware(this WebApplication app)
    {
        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        // Global error handler
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred."
                });
            });
        });

        // Only use HTTPS redirection in production
        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        // Use CORS - must be before authorization
        app.UseCors("AllowAngular");

        app.UseAuthorization();
        app.MapControllers();
        
        // Health check endpoint for monitoring and smoke tests
        app.MapGet("/health", () => Results.Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0"
        }));

        return app;
    }

    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<WorldCupContext>();
            await context.Database.EnsureCreatedAsync();
            DbInitializer.Initialize(context);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while initializing the database.");
        }
    }
}
