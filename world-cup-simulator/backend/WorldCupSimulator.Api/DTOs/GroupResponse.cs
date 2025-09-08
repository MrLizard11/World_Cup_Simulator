namespace WorldCupSimulator.Api.DTOs
{
    public class GroupResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<GroupTeamResponse> Teams { get; set; }
        public ICollection<GroupMatchResponse> Matches { get; set; }

        public GroupResponse()
        {
            Teams = new List<GroupTeamResponse>();
            Matches = new List<GroupMatchResponse>();
        }
    }
}
