using System.Text;
using LittleGeniusLab.Api.Configuration;
using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Endpoints;
using LittleGeniusLab.Api.Models;
using LittleGeniusLab.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<AdminOptions>(builder.Configuration.GetSection(AdminOptions.SectionName));
builder.Services.Configure<RazorpayOptions>(builder.Configuration.GetSection(RazorpayOptions.SectionName));
builder.Services.Configure<AzureBlobOptions>(builder.Configuration.GetSection(AzureBlobOptions.SectionName));
builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection(EmailOptions.SectionName));
builder.Services.Configure<SmsOptions>(builder.Configuration.GetSection(SmsOptions.SectionName));
builder.Services.Configure<NotificationOptions>(builder.Configuration.GetSection(NotificationOptions.SectionName));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "LittleGenius LAB API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter a valid JWT token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Id = "Bearer",
                    Type = ReferenceType.SecurityScheme
                }
            },
            []
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        var frontendUrl = builder.Configuration["FRONTEND_URL"];
        var origins = new List<string>
        {
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://localhost:3000",
            "https://little-genius-lab.vercel.app",
            "https://littlegeniuslab.in",
            "https://www.littlegeniuslab.in"
        };

        if (!string.IsNullOrWhiteSpace(frontendUrl))
        {
            origins.Add(frontendUrl);
        }

        policy
            .WithOrigins(origins.ToArray())
            .SetIsOriginAllowed(origin => 
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                
                // Normalise origin by removing trailing slash for comparison
                var normalizedOrigin = origin.TrimEnd('/');

                // Allow localhost
                if (normalizedOrigin.Contains("localhost") || normalizedOrigin.Contains("127.0.0.1")) return true;
                
                // Allow production domain
                if (normalizedOrigin.Equals("https://little-genius-lab.vercel.app", StringComparison.OrdinalIgnoreCase)) return true;
                if (normalizedOrigin.Equals("https://littlegeniuslab.in", StringComparison.OrdinalIgnoreCase)) return true;
                if (normalizedOrigin.Equals("https://www.littlegeniuslab.in", StringComparison.OrdinalIgnoreCase)) return true;
                
                // Allow Vercel preview URLs
                if (normalizedOrigin.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase)) return true;

                // Allow configured URL
                if (!string.IsNullOrWhiteSpace(frontendUrl) && normalizedOrigin.Equals(frontendUrl.TrimEnd('/'), StringComparison.OrdinalIgnoreCase)) return true;

                return false;
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var sqlServerConnection = builder.Configuration.GetConnectionString("SqlServer");
var sqliteConnection = builder.Configuration.GetConnectionString("Sqlite");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (builder.Environment.IsDevelopment() && !string.IsNullOrWhiteSpace(sqliteConnection))
    {
        options.UseSqlite(sqliteConnection);
        return;
    }

    if (string.IsNullOrWhiteSpace(sqlServerConnection))
    {
        throw new InvalidOperationException("Connection string 'SqlServer' not found.");
    }

    options.UseSqlServer(sqlServerConnection);
});

var jwtOptions = builder.Configuration
    .GetSection(JwtOptions.SectionName)
    .Get<JwtOptions>() ?? new JwtOptions();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = signingKey,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole(AppRoles.Admin));
});

builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<FileStorageService>();
builder.Services.AddScoped<IFileStorageService>(static sp => sp.GetRequiredService<FileStorageService>());
builder.Services.AddHttpClient<RazorpayService>();
builder.Services.AddHttpClient<ShiprocketService>();
builder.Services.AddHttpClient<WhatsAppNotificationService>();
builder.Services.AddHttpClient("sms");
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddSingleton<INotificationQueue, NotificationQueue>();
builder.Services.AddHostedService<NotificationBackgroundService>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Use Migrate() for production-ready schema management instead of EnsureCreated()
    if (db.Database.IsRelational())
    {
        await db.Database.MigrateAsync();
    }
    else
    {
        db.Database.EnsureCreated();
    }
    await DatabaseSchemaUpdater.ApplyAsync(db);
    await SeedData.InitializeAsync(db);
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    name = "LittleGenius LAB API",
    status = "running",
    docs = "/swagger"
}));

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    service = "LittleGenius LAB API",
    timestamp = DateTimeOffset.UtcNow
}));

app.MapControllers();

app.MapAuthEndpoints();
app.MapStorefrontEndpoints();
app.MapGuestOrderMergeEndpoint();
app.MapAccountEndpoints();
app.MapReviewEndpoints();
app.MapAdminEndpoints();

app.Run();
