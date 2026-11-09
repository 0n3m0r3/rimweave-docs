---
title: RimWeave for RimWorld modders
_layout: landing
---

<div class="rw-hero">
  <div class="rw-kicker">RimWorld 1.7 · Developer documentation</div>
  <h1>RimWeave for<br>RimWorld modders.</h1>
  <p class="rw-lead">RimWeave is a C# library that runs as a RimWorld mod. It helps your mod identify the effects it adds and share information about them with other mods.</p>
  <p>Your mod decides what happens in the game. RimWeave provides common ways to find an effect, describe what caused it, and request its removal.</p>
  <div class="rw-actions">
    <a class="rw-button rw-button-primary" href="getting-started/index.md">See how it works</a>
    <a class="rw-button" href="getting-started/installation.md">Build the project</a>
  </div>
  <div class="rw-facts"><span>RimWorld 1.7</span><span>C# / .NET 10</span><span>MIT license</span><span>Experimental</span></div>
</div>

<div class="rw-section">
  <h2>Two mods affect the same hand</h2>
  <p>Imagine a mod that adds a temporary effect while a character wears a reinforced glove. A second mod adds an effect after surgery on the same hand. When the glove comes off, its effect should disappear and the surgical effect should remain.</p>
  <p>RimWorld already stores and removes health effects. RimWeave lets cooperating mods describe which effect belongs to which mod, find the intended effect, and avoid requesting native removal again if that exact effect is already gone.</p>
  <p><a href="getting-started/index.md">Follow this example step by step</a></p>
</div>

<div class="rw-section rw-grid">
  <div class="rw-card">
    <div class="rw-step">01 · Understand</div>
    <h2>Follow one effect</h2>
    <p>See what the game already does, what RimWeave adds, and which decisions remain in your mod.</p>
    <a href="getting-started/index.md">Start with the example</a>
  </div>
  <div class="rw-card">
    <div class="rw-step">02 · Try it</div>
    <h2>Describe an effect in C#</h2>
    <p>Give an effect a name that identifies its mod, then record why it exists. Each step explains the code and its result.</p>
    <a href="getting-started/first-contribution.md">Work through the first example</a>
  </div>
  <div class="rw-card">
    <div class="rw-step">03 · Use it</div>
    <h2>Connect it to the game</h2>
    <p>Use the game's health effects, choose the intended body part, and interpret the result of a removal request.</p>
    <a href="guides/health-effects.md">Add information to a health effect</a>
  </div>
</div>

<div class="rw-section rw-contract">
  <h2>A library for your mod</h2>
  <p>RimWeave supplies no gameplay rules of its own. It does not decide how powerful the glove is, whether surgery is reversible, or which mod should win a disagreement. Mods must deliberately use its API to share this information.</p>
</div>

<div class="rw-section">
  <h2>Already looking for something specific?</h2>
  <ul>
    <li><a href="concepts/origins.md">Describe what caused an effect</a></li>
    <li><a href="concepts/cooperation.md">Report two mods claiming the same job</a></li>
    <li><a href="guides/persistence.md">Keep an effect's information when saving and loading</a></li>
    <li><a href="api/index.md">Look up a C# class or method</a></li>
  </ul>
  <div class="rw-preview">This is an experimental version. The <a href="compatibility/index.md">tested behavior and current limits</a> are listed separately so you can decide whether it fits your mod.</div>
  <p><a href="compatibility/versions.md">Check which framework revision these pages describe</a></p>
</div>
