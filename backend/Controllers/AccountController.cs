using Microsoft.AspNetCore.Mvc;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(string username, string password)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username && u.Password == password);

            if (user != null)
            {
                // Simple session-based login for demonstration
                HttpContext.Session.SetString("UserSession", user.Username);
                HttpContext.Session.SetString("UserRole", user.Role);
                return RedirectToAction("Index", "Home");
            }

            ViewBag.Error = "Invalid username or password";
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }
    }
}
