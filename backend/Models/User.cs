using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; }

        [Required]
        [MaxLength(255)]
        public string Password { get; set; }

        public string Role { get; set; } = "User";
    }
}
