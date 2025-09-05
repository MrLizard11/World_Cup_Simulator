namespace WorldCupSimulator.Api.DTOs;

public class AddTeamsToGroupRequest
{
    public List<int> TeamIds { get; set; } = new List<int>();
}
