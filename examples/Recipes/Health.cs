using RimWeave.Contributions;
using RimWeave.Health;
using RimWeave.References;
using Verse;

namespace RimWeave.Documentation.Examples;

// These native recipes are compiled but are not invoked by the standalone checks.
internal static class HealthRecipes
{
    #region attach
    internal static ContributionAdditionResult Attach(
        Pawn pawn, HediffDef definition, BodyPartRecord? part,
        ContributionId identity, ContributionOrigin origin)
    {
        var nativeEffect = HediffMaker.MakeHediff(definition, pawn, part);
        if (nativeEffect is not ContributionHediff effect)
            throw new InvalidOperationException("The definition must use ContributionHediff.");

        effect.Metadata.AssignIdentity(identity);
        effect.Metadata.DescribeOrigin(origin);
        return ContributionOperations.Add(pawn, effect, part);
    }
    #endregion

    #region xml-attach
    internal static ContributionAdditionResult AttachDeclared(
        Pawn pawn, HediffDef definition, BodyPartRecord? part, ContributionOrigin origin)
    {
        if (ContributionDefExtension.Read(definition) is null)
            throw new InvalidOperationException("The definition must declare contribution metadata.");
        var effect = (ContributionHediff)HediffMaker.MakeHediff(definition, pawn, part);
        effect.Metadata.DescribeOrigin(origin);
        return ContributionOperations.Add(pawn, effect, part);
    }
    #endregion

    #region xml-query
    internal static ContributionLookupResult<ContributionHediff> FindDeclaredOnPart(
        Pawn pawn, HediffDef definition, BodyPartRecord part)
    {
        var declaration = ContributionDefExtension.Read(definition)
            ?? throw new InvalidOperationException("The definition must declare contribution metadata.");
        return ContributionQueries.Resolve(pawn, declaration.Identity!, part);
    }
    #endregion

    #region query
    internal static ContributionLookupResult<ContributionHediff> FindOnPart(
        Pawn pawn, ContributionId identity, BodyPartRecord part)
    {
        return ContributionQueries.Resolve(pawn, identity, part);
    }
    #endregion

    #region observe-part
    internal static bool IsAttachedTo(
        NativeReference reference, Pawn expectedPawn, BodyPartRecord? expectedPart)
    {
        var snapshot = reference.Capture();
        return snapshot.Resolution == NativeReferenceResolution.Resolved
            && snapshot.Effect is not null
            && snapshot.EffectAttached == true
            && ReferenceEquals(snapshot.Pawn, expectedPawn)
            && ReferenceEquals(snapshot.EffectPart, expectedPart);
    }
    #endregion

    #region remove-instance
    internal static HediffRemovalResult RemoveInstance(Pawn pawn, Hediff effect)
    {
        return HediffOperations.Remove(pawn, effect);
    }
    #endregion

    #region remove-identity
    internal static string RemoveByIdentity(
        Pawn pawn, ContributionId identity, BodyPartRecord? part)
    {
        var result = ContributionOperations.Remove(pawn, identity, part);
        if (result.Removal is null)
            return $"No removal requested: lookup={result.Lookup.Status}";

        return $"Guarded removal outcome: {result.Removal.Status}";
    }
    #endregion
}
