namespace WorldCupSimulator.Api.DTOs
{
    public class CreateTeamRequest
    {
        public required string Name { get; set; }
        public required string Country { get; set; }
        public int Elo { get; set; }
        public required string CountryCode { get; set; }
    }
}
