using WorldCupSimulator.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services
    .AddJsonOptions()
    .AddSwaggerDoc()
    .AddDatabase(builder.Configuration)
    .AddApplicationServices()
    .AddCorsPolicy(builder.Configuration);

var app = builder.Build();

// Initialize Database and configure middleware
await app.InitializeDatabaseAsync();
app.ConfigureMiddleware();

await app.RunAsync();
