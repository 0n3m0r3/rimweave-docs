using RimWorld;
using Verse;

namespace RimWeave.Documentation.Examples;

// Native recipes are compiled, not invoked by the standalone example checks.
internal static class EquipmentRecipes
{
    #region worn-coverage
    internal static IReadOnlyList<Apparel> WornOverPart(Pawn initializedPawn, BodyPartRecord selectedPart)
    {
        return Array.AsReadOnly(initializedPawn.apparel.WornApparel
            .Where(item => item.def.apparel.CoversBodyPart(selectedPart))
            .ToArray());
    }
    #endregion
}
