using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/students")]
    [ApiController]
    [Authorize]
    public class StudentsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET /api/students?query=...
        // Returns all students when query is empty; otherwise partial case-insensitive match on Name or Phone.
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? query)
        {
            IQueryable<Student> students = _context.Students;

            if (!string.IsNullOrWhiteSpace(query))
            {
                var q = query.Trim().ToLower();
                students = students.Where(s =>
                    s.Name.ToLower().Contains(q) ||
                    s.Phone.Contains(q));
            }

            var result = await students
                .OrderBy(s => s.Name)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Age,
                    s.Gender,
                    s.Phone,
                    s.Email,
                    s.Address
                })
                .ToListAsync();

            return Ok(result);
        }

        // GET /api/students/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
                return NotFound(new { error = $"Student with id {id} not found." });

            return Ok(student);
        }

        // POST /api/students
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Student student)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
        }

        // PUT /api/students/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Student updated)
        {
            if (id != updated.Id)
                return BadRequest(new { error = "ID mismatch." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _context.Students.FindAsync(id);
            if (existing == null)
                return NotFound(new { error = $"Student with id {id} not found." });

            existing.Name    = updated.Name;
            existing.Age     = updated.Age;
            existing.Gender  = updated.Gender;
            existing.Phone   = updated.Phone;
            existing.Email   = updated.Email;
            existing.Address = updated.Address;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE /api/students/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
                return NotFound(new { error = $"Student with id {id} not found." });

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
