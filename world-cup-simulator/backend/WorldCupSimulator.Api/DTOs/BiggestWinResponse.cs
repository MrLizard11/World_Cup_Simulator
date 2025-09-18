namespace WorldCupSimulator.Api.DTOs;

public class BiggestWinResponse
{
    public string Match { get; set; } = string.Empty;
    public string Score { get; set; } = string.Empty;
    public int Difference { get; set; }
}