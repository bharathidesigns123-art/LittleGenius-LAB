using System.Text;
using LittleGeniusLab.Api.Configuration;
using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Endpoints;
using LittleGeniusLab.Api.Models;
using LittleGeniusLab.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<RazorpayOptions>(builder.Configuration.GetSection(RazorpayOptions.SectionName));

builder.Services.AddEndpointsApiExplorer();
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
            "https://localhost:3000"
        };

        if (!string.IsNullOrWhiteSpace(frontendUrl))
        {
            origins.Add(frontendUrl);
        }

        policy
            .WithOrigins(origins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var sqlServerConnection = builder.Configuration.GetConnectionString("SqlServer");
var sqliteConnection = builder.Configuration.GetConnectionString("Sqlite");

if (!string.IsNullOrWhiteSpace(sqlServerConnection))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(sqlServerConnection));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(sqliteConnection));
}

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
builder.Services.AddHttpClient<RazorpayService>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

var webRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
var uploadsRoot = Path.Combine(webRoot, "uploads");
var dataRoot = Path.Combine(app.Environment.ContentRootPath, "data");

Directory.CreateDirectory(uploadsRoot);
Directory.CreateDirectory(dataRoot);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    await DatabaseSchemaUpdater.ApplyAsync(db);
    await SeedData.InitializeAsync(db);
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("frontend");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(webRoot),
    RequestPath = string.Empty
});
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    name = "LittleGenius LAB API",
    status = "running",
    docs = "/swagger",
    uploadedAssets = "/uploads"
}));

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    service = "LittleGenius LAB API",
    timestamp = DateTimeOffset.UtcNow
}));

app.MapAuthEndpoints();
app.MapStorefrontEndpoints();
app.MapAccountEndpoints();
app.MapReviewEndpoints();
app.MapAdminEndpoints();

app.Run();
