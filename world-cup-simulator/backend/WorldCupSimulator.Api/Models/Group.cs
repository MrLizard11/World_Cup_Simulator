namespace WorldCupSimulator.Api.Models;

public class Group
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<GroupTeam> Teams { get; set; } = new List<GroupTeam>();
    public ICollection<GroupMatch> Matches { get; set; } = new List<GroupMatch>();
}
