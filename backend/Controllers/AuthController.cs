using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config  = config;
        }

        // POST /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "Username and password are required." });

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest(new { error = "Username already exists." });

            var user = new User
            {
                Username = request.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role     = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully." });
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "Username and password are required." });

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                return Unauthorized(new { error = "Invalid username or password." });

            var token     = GenerateJwtToken(user);
            var expiryMin = int.TryParse(_config["Jwt:ExpiryMinutes"], out var m) ? m : 60;
            var expiresAt = DateTime.UtcNow.AddMinutes(expiryMin);

            return Ok(new
            {
                token,
                expiresAt,
                role     = user.Role,
                username = user.Username
            });
        }

        // ── Helpers ───────────────────────────────────────────────────────────
        private string GenerateJwtToken(User user)
        {
            var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiryMin   = int.TryParse(_config["Jwt:ExpiryMinutes"], out var m) ? m : 60;

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer:             _config["Jwt:Issuer"],
                audience:           _config["Jwt:Audience"],
                claims:             claims,
                expires:            DateTime.UtcNow.AddMinutes(expiryMin),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public record LoginRequest(string Username, string Password);
    public record RegisterRequest(string Username, string Password);
}
