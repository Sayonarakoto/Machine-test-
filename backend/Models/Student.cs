using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Student
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(1, 120, ErrorMessage = "Age must be between 1 and 120.")]
        public int Age { get; set; }

        [Required]
        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone number must be exactly 10 digits.")]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;
    }
}
