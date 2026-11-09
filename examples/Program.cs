using RimWeave.Contributions;
using RimWeave.Documentation.Examples;

int checks = 0;
void Expect(bool condition, string message)
{
    if (!condition)
        throw new InvalidOperationException(message);
    checks++;
}

var equipment = ContributionRecipes.DescribeEquipment();
Expect(equipment.Metadata.Identity == new ContributionId("example.fieldgear", "glove-support"),
    "The documented recipe must keep the contribution owner.");
Expect(equipment.Metadata.Origin?.Type == new ContributionOriginType("example.equipment", "equipped"),
    "The recipe must retain its custom origin type.");
Expect(equipment.Metadata.Origin?.SourceReference == "example.fieldgear:glove/42",
    "The recipe must retain the supplied source reference.");

var claims = ContributionRecipes.FindClaimants();
Expect(claims.Status == ContributionLookupStatus.Ambiguous && claims.Matches.Count == 2,
    "Two explicit claimants must be reported without selecting a winner.");
Expect(claims.Matches[0].Metadata.Identity != claims.Matches[1].Metadata.Identity,
    "The two providers must retain independent identities.");
Expect(ContributionResolver.Resolve(claims.Matches, new ContributionId("example.fieldgear", "glove-support"))
        .Status == ContributionLookupStatus.Found,
    "An ambiguous claim must not prevent a unique identity lookup.");

var undescribed = new ProtectionContribution();
Expect(undescribed.Metadata.Origin is null, "No origin may be inferred from the containing type.");
undescribed.Metadata.DescribeOrigin(new ContributionOrigin(ContributionOriginType.Unknown));
Expect(undescribed.Metadata.Origin?.Type == ContributionOriginType.Unknown && undescribed.Metadata.Identity is null,
    "Explicit unknown provenance must not invent a contribution owner.");
Expect(ContributionRecipes.Impact != new ContributionOriginType("another.mod", "impact"),
    "Different origin namespaces must remain distinct.");

Console.WriteLine($"Documentation examples passed: {checks} checks. Native mutation recipes were compiled, not executed.");
