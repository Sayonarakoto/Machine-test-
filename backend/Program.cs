using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Add services ──────────────────────────────────────────────────────────────
builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();

// EF Core + MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// JWT Authentication
var jwtKey    = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAud    = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtIssuer,
        ValidAudience            = jwtAud,
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// CORS – allow React dev origin
var reactOrigin = builder.Configuration["Cors:AllowedOrigin"] ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
        policy.WithOrigins(reactOrigin)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Session (kept for MVC login flow)
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout    = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly    = true;
    options.Cookie.IsEssential = true;
});

// ── Build app ─────────────────────────────────────────────────────────────────
var app = builder.Build();

// Seed default admin user
await SeedAdminUserAsync(app);

// Pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("ReactPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

// ── Seed helper ───────────────────────────────────────────────────────────────
static async Task SeedAdminUserAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    try
    {
        await db.Database.EnsureCreatedAsync();

        var adminUsername = app.Configuration["AdminUser:Username"] ?? "admin";
        var adminPassword = app.Configuration["AdminUser:Password"] ?? "Admin@1234";
        var adminRole     = app.Configuration["AdminUser:Role"]     ?? "Admin";

        if (!await db.Users.AnyAsync(u => u.Username == adminUsername))
        {
            db.Users.Add(new User
            {
                Username = adminUsername,
                Password = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role     = adminRole
            });
            await db.SaveChangesAsync();
            Console.WriteLine($"[Seed] Admin user '{adminUsername}' created.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Seed] Warning: {ex.Message}");
    }
}
