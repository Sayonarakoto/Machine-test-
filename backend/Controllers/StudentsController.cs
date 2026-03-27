using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Controllers
{
    public class StudentsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public StudentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET /Students/Index?query=...
        public async Task<IActionResult> Index(string? query)
        {
            ViewBag.Query = query;
            IQueryable<Student> students = _context.Students;

            if (!string.IsNullOrWhiteSpace(query))
            {
                var q = query.Trim().ToLower();
                students = students.Where(s =>
                    s.Name.ToLower().Contains(q) ||
                    s.Phone.Contains(q));
            }

            var list = await students.OrderBy(s => s.Name).ToListAsync();
            return View(list);
        }

        // GET /Students/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST /Students/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Student student)
        {
            if (!ModelState.IsValid)
                return View(student);

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Student '{student.Name}' was added successfully.";
            return RedirectToAction(nameof(Index));
        }
    }
}
