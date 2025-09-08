namespace WorldCupSimulator.Api.DTOs
{
    public class TeamResponse
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Country { get; set; }
        public int Elo { get; set; }
        public required string CountryCode { get; set; }
    }
}
