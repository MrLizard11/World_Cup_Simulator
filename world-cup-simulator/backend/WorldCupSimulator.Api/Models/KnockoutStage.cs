namespace WorldCupSimulator.Api.Models;

public class KnockoutStage
{
    public int Id { get; set; }

    // Foreign key properties
    public int? ThirdPlaceMatchId { get; set; }
    public int? FinalMatchId { get; set; }

    // Navigation properties
    public ICollection<KnockoutMatch> RoundOf16 { get; set; } = new List<KnockoutMatch>();
    public ICollection<KnockoutMatch> QuarterFinals { get; set; } = new List<KnockoutMatch>();
    public ICollection<KnockoutMatch> SemiFinals { get; set; } = new List<KnockoutMatch>();
    public KnockoutMatch? ThirdPlaceMatch { get; set; }
    public KnockoutMatch? Final { get; set; }
}
