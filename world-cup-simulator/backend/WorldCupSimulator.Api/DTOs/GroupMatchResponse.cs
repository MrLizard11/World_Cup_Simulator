namespace WorldCupSimulator.Api.DTOs
{
    public class GroupMatchResponse
    {
        public int Id { get; set; }
        public int TeamAId { get; set; }
        public required string TeamAName { get; set; }
        public required string TeamACountryCode { get; set; }
        public int TeamBId { get; set; }
        public required string TeamBName { get; set; }
        public required string TeamBCountryCode { get; set; }
        public int? ScoreA { get; set; }
        public int? ScoreB { get; set; }
        public bool Played { get; set; }
        public int GroupId { get; set; }
    }
}
