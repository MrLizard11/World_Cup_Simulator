namespace WorldCupSimulator.Api.DTOs
{
    public class GroupTeamResponse
    {
        public int GroupId { get; set; }
        public int TeamId { get; set; }
        public string? TeamName { get; set; }
        public string? TeamCountry { get; set; }
        public string? TeamCountryCode { get; set; }
        public int TeamElo { get; set; }
        public int Points { get; set; }
        public int MatchesPlayed { get; set; }
        public int Wins { get; set; }
        public int Draws { get; set; }
        public int Losses { get; set; }
        public int GoalsFor { get; set; }
        public int GoalsAgainst { get; set; }
        public int GoalDifference { get; set; }
    }
}
