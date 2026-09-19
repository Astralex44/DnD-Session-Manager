using DndSessionManager.Api.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using static DndSessionManager.Api.Pdf.CharacterSheetColors;

namespace DndSessionManager.Api.Pdf;

// Composes the character sheet PDF export. Layout/section grouping follows
// docs/mockups/DnD_Tool_Charakterbogen_Rhogar.pdf (the reference design),
// colors follow src/frontend/src/index.css's palette.
public class CharacterSheetDocument(CharacterDetailDto character) : IDocument
{
    private static readonly (string Skill, string Ability)[] SkillAbilityPairs =
    [
        ("Acrobatics", "Dexterity"), ("Animal Handling", "Wisdom"), ("Arcana", "Intelligence"),
        ("Athletics", "Strength"), ("Deception", "Charisma"), ("History", "Intelligence"),
        ("Insight", "Wisdom"), ("Intimidation", "Charisma"), ("Investigation", "Intelligence"),
        ("Medicine", "Wisdom"), ("Nature", "Intelligence"), ("Perception", "Wisdom"),
        ("Performance", "Charisma"), ("Persuasion", "Charisma"), ("Religion", "Intelligence"),
        ("Sleight of Hand", "Dexterity"), ("Stealth", "Dexterity"), ("Survival", "Wisdom"),
    ];

    private static readonly Dictionary<string, string> SkillAbility =
        SkillAbilityPairs.ToDictionary(p => p.Skill, p => p.Ability);

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;
    public DocumentSettings GetSettings() => DocumentSettings.Default;

    public void Compose(IDocumentContainer container)
    {
        var sheet = character.ActiveLevelSheet;

        ComposeCorePage(container, sheet);
        ComposePersonalityPage(container, sheet);
        if (sheet?.Spellcasting is not null)
        {
            ComposeSpellcastingPage(container, sheet);
        }
    }

    private void ComposeCorePage(IDocumentContainer container, LevelSheetDetailDto? sheet)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(28);
            page.PageColor(Bg);
            page.DefaultTextStyle(x => x.FontColor(Text).FontSize(9.5f));

            page.Header().Element(c => Header(c, sheet));

            page.Content().PaddingTop(10).Row(row =>
            {
                row.RelativeItem(4).Element(c => LeftColumn(c, sheet));
                row.ConstantItem(14);
                row.RelativeItem(6).Element(c => RightColumn(c, sheet));
            });

            page.Footer().Element(Footer);
        });
    }

    private void Header(IContainer container, LevelSheetDetailDto? sheet)
    {
        container.Column(column =>
        {
            column.Item().Text(character.Name.ToUpperInvariant()).FontSize(22).Bold().FontColor(PrimaryDark);
            column.Item().PaddingTop(2).Text(text =>
            {
                text.DefaultTextStyle(x => x.FontSize(9.5f).FontColor(TextMuted));
                text.Span($"Race: {Fallback(character.Race)}    ·    Class: {Fallback(character.Class)}");
                if (sheet is not null) text.Span($" {sheet.Level}");
                text.Span($"    ·    Background: {Fallback(character.Background)}");
                text.Span($"    ·    Alignment: {Fallback(character.Alignment)}");
                text.Span($"    ·    XP: {character.ExperiencePoints}");
            });
            column.Item().PaddingTop(6).LineHorizontal(1.5f).LineColor(Primary);
        });
    }

    private void LeftColumn(IContainer container, LevelSheetDetailDto? sheet)
    {
        container.Column(column =>
        {
            SectionTitle(column, "Attributes");
            foreach (var (name, score) in Abilities())
            {
                AbilityRow(column, name, score);
            }

            SectionTitle(column, "Saving Throws");
            column.Item().Element(Box).Padding(2).Column(list =>
            {
                foreach (var save in character.Saves)
                {
                    var mod = Modifier(AbilityScore(save.Ability)) + (save.Proficient ? ProficiencyBonus(sheet) : 0);
                    ListRow(list, save.Ability, mod, save.Proficient);
                }
            });

            SectionTitle(column, "Skills");
            column.Item().Element(Box).Padding(2).Column(list =>
            {
                foreach (var skill in character.Skills.OrderBy(s => s.SkillName))
                {
                    var ability = SkillAbility.GetValueOrDefault(skill.SkillName, "Strength");
                    var mod = Modifier(AbilityScore(ability)) + (skill.Proficient ? ProficiencyBonus(sheet) : 0);
                    ListRow(list, $"{skill.SkillName} ({AbilityAbbrev(ability)})", mod, skill.Proficient);
                }
            });
        });
    }

    private void RightColumn(IContainer container, LevelSheetDetailDto? sheet)
    {
        container.Column(column =>
        {
            SectionTitle(column, "Combat");
            column.Item().Row(row =>
            {
                StatBox(row, "AC", character.ArmorClass.ToString());
                StatBox(row, "Initiative", FmtMod(character.Initiative));
                StatBox(row, "Speed", $"{character.Speed} ft");
                StatBox(row, "Prof. Bonus", FmtMod(ProficiencyBonus(sheet)));
                StatBox(row, "Passive Perc.", character.PassivePerception.ToString());
            });
            column.Item().PaddingTop(4).Row(row =>
            {
                StatBox(row, "HP Max", sheet?.HpMax.ToString() ?? "—");
                StatBox(row, "HP Current", character.HpCurrent.ToString());
                StatBox(row, "HP Temp", character.HpTemporary.ToString());
                StatBox(row, "Hit Dice", Fallback(character.HitDiceTotal));
            });
            column.Item().PaddingTop(4).Element(Box).Padding(6).Row(row =>
            {
                row.RelativeItem().Text(text =>
                {
                    text.Span("Death Saves — Successes: ").FontColor(TextMuted).FontSize(9);
                    text.Span(Dots(character.DeathSaveSuccesses, 3)).FontColor(Secondary).FontSize(11);
                });
                row.RelativeItem().Text(text =>
                {
                    text.Span("Failures: ").FontColor(TextMuted).FontSize(9);
                    text.Span(Dots(character.DeathSaveFailures, 3)).FontColor(Error).FontSize(11);
                });
            });

            SectionTitle(column, "Attacks & Spell Attacks");
            if (character.Attacks.Count == 0)
            {
                column.Item().Text("—").FontColor(TextMuted).Italic();
            }
            else
            {
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(cols =>
                    {
                        cols.RelativeColumn(3);
                        cols.RelativeColumn(2);
                        cols.RelativeColumn(3);
                    });
                    table.Header(header =>
                    {
                        HeaderCell(header, "Name");
                        HeaderCell(header, "Bonus");
                        HeaderCell(header, "Damage / Type");
                    });
                    foreach (var attack in character.Attacks)
                    {
                        BodyCell(table, attack.Name);
                        BodyCell(table, attack.AtkBonus);
                        BodyCell(table, attack.DamageType);
                    }
                });
            }

            SectionTitle(column, "Equipment");
            column.Item().Element(Box).Padding(8).Column(list =>
            {
                if (character.Items.Count == 0)
                {
                    list.Item().Text("—").FontColor(TextMuted).Italic();
                }
                foreach (var item in character.Items)
                {
                    var suffix = item.Category.Length > 0 ? $" ({item.Category})" : "";
                    list.Item().Text($"• {item.Name}{suffix} ({item.Quantity}×)").FontSize(9.5f);
                }
            });

            if (character.OtherProficiencies.Length > 0)
            {
                SectionTitle(column, "Other Proficiencies & Languages");
                column.Item().Element(Box).Padding(8).Text(character.OtherProficiencies).FontSize(9.5f);
            }

            var features = string.Join("\n", new[] { character.FeaturesTraits, character.AdditionalFeatures }.Where(s => s.Length > 0));
            if (features.Length > 0)
            {
                SectionTitle(column, "Features & Traits");
                column.Item().Element(Box).Padding(8).Text(features).FontSize(9.5f);
            }
        });
    }

    private void ComposePersonalityPage(IDocumentContainer container, LevelSheetDetailDto? sheet)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(28);
            page.PageColor(Bg);
            page.DefaultTextStyle(x => x.FontColor(Text).FontSize(9.5f));

            page.Header().Element(c => Header(c, sheet));

            page.Content().PaddingTop(10).Column(column =>
            {
                column.Item().Row(row =>
                {
                    row.RelativeItem().PaddingRight(6).Element(c => LabeledBox(c, "Personality Traits", character.PersonalityTraits));
                    row.RelativeItem().PaddingLeft(6).Element(c => LabeledBox(c, "Ideals", character.Ideals));
                });
                column.Item().PaddingTop(8).Row(row =>
                {
                    row.RelativeItem().PaddingRight(6).Element(c => LabeledBox(c, "Bonds", character.Bonds));
                    row.RelativeItem().PaddingLeft(6).Element(c => LabeledBox(c, "Flaws", character.Flaws));
                });
                column.Item().PaddingTop(8).Element(c => LabeledBox(c, "Backstory", character.Backstory, minHeight: 130));
                if (character.AlliesOrganizations.Length > 0)
                {
                    column.Item().PaddingTop(8).Element(c => LabeledBox(c, "Allies & Organizations", character.AlliesOrganizations));
                }
                if (character.Treasure.Length > 0)
                {
                    column.Item().PaddingTop(8).Element(c => LabeledBox(c, "Treasure", character.Treasure));
                }

                column.Item().PaddingTop(10).Text("APPEARANCE".ToUpperInvariant()).FontSize(10).Bold().FontColor(TextMuted);
                column.Item().PaddingBottom(6).LineHorizontal(1).LineColor(Border);
                column.Item().Row(row =>
                {
                    StatBox(row, "Age", Fallback(character.Age));
                    StatBox(row, "Height", Fallback(character.Height));
                    StatBox(row, "Weight", Fallback(character.Weight));
                    StatBox(row, "Eyes", Fallback(character.Eyes));
                });
                column.Item().PaddingTop(4).Row(row =>
                {
                    StatBox(row, "Skin", Fallback(character.Skin));
                    StatBox(row, "Hair", Fallback(character.Hair));
                });
            });

            page.Footer().Element(Footer);
        });
    }

    private void ComposeSpellcastingPage(IDocumentContainer container, LevelSheetDetailDto sheet)
    {
        var spellcasting = sheet.Spellcasting!;

        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(28);
            page.PageColor(Bg);
            page.DefaultTextStyle(x => x.FontColor(Text).FontSize(9.5f));

            page.Header().Element(c => Header(c, sheet));

            page.Content().PaddingTop(10).Column(column =>
            {
                column.Item().Text($"Spellcasting — {spellcasting.Class}").FontSize(13).Bold().FontColor(PrimaryDark);
                column.Item().PaddingTop(8).Row(row =>
                {
                    StatBox(row, "Ability", spellcasting.Ability);
                    StatBox(row, "Save DC", spellcasting.SpellSaveDc.ToString());
                    StatBox(row, "Attack Bonus", FmtMod(spellcasting.SpellAttackBonus));
                });

                var cantrips = sheet.Spells.Where(s => s.Level == 0).ToList();
                var leveled = sheet.Spells.Where(s => s.Level > 0).OrderBy(s => s.Level).ThenBy(s => s.Name).ToList();

                column.Item().PaddingTop(12).Row(row =>
                {
                    row.RelativeItem().PaddingRight(6).Column(col =>
                    {
                        SectionTitle(col, "Cantrips");
                        SpellList(col, cantrips);
                    });
                    row.RelativeItem().PaddingLeft(6).Column(col =>
                    {
                        SectionTitle(col, "Leveled Spells");
                        SpellList(col, leveled, showLevel: true);
                    });
                });

                if (sheet.SpellSlots.Count > 0)
                {
                    column.Item().PaddingTop(12).Text("Spell Slots").FontSize(10).Bold().FontColor(TextMuted);
                    column.Item().PaddingBottom(6).LineHorizontal(1).LineColor(Border);
                    column.Item().Row(row =>
                    {
                        foreach (var slot in sheet.SpellSlots.OrderBy(s => s.Level))
                        {
                            StatBox(row, $"Level {slot.Level}", $"{slot.Expended} / {slot.Total}");
                        }
                    });
                }
            });

            page.Footer().Element(Footer);
        });
    }

    private static void SpellList(ColumnDescriptor column, IReadOnlyList<SpellDto> spells, bool showLevel = false)
    {
        column.Item().Element(Box).Padding(8).Column(list =>
        {
            if (spells.Count == 0)
            {
                list.Item().Text("—").FontColor(TextMuted).Italic();
                return;
            }
            foreach (var spell in spells)
            {
                var prefix = showLevel ? $"Lv{spell.Level} " : "";
                var homebrew = spell.IsHomebrew ? " (Homebrew)" : "";
                list.Item().Text($"{(spell.Prepared ? "●" : "○")} {prefix}{spell.Name}{homebrew}").FontSize(9.5f);
                if (spell.IsHomebrew && !string.IsNullOrWhiteSpace(spell.Description))
                {
                    list.Item().PaddingLeft(14).PaddingBottom(2).Text(spell.Description).FontSize(8.5f).Italic().FontColor(TextMuted);
                }
            }
        });
    }

    private static void SectionTitle(ColumnDescriptor column, string title)
    {
        column.Item().PaddingTop(8).Text(title.ToUpperInvariant()).FontSize(10).Bold().FontColor(TextMuted);
        column.Item().PaddingBottom(4).LineHorizontal(1).LineColor(Border);
    }

    private static void AbilityRow(ColumnDescriptor column, string name, int score)
    {
        column.Item().PaddingBottom(4).Element(Box).Padding(6).Row(row =>
        {
            row.RelativeItem().Text($"{AbilityAbbrev(name)}  {score}").FontSize(10).Bold().FontColor(Text);
            row.ConstantItem(36).AlignRight().Text(FmtMod(Modifier(score))).FontSize(13).Bold().FontColor(PrimaryDark);
        });
    }

    private static void ListRow(ColumnDescriptor column, string label, int mod, bool proficient)
    {
        column.Item().PaddingVertical(2).BorderBottom(1).BorderColor(Border).Row(row =>
        {
            row.ConstantItem(12).Text(proficient ? "●" : "○").FontSize(8).FontColor(proficient ? Primary : TextMuted);
            row.RelativeItem().PaddingLeft(3).Text(label).FontSize(9).FontColor(Text);
            row.ConstantItem(26).AlignRight().Text(FmtMod(mod)).FontSize(8.5f).FontColor(TextMuted);
        });
    }

    private static void StatBox(RowDescriptor row, string label, string value)
    {
        row.RelativeItem().PaddingRight(4).Element(Box).Padding(6).Column(col =>
        {
            col.Item().AlignCenter().Text(label.ToUpperInvariant()).FontSize(7).FontColor(TextMuted);
            col.Item().AlignCenter().Text(value).FontSize(13).Bold().FontColor(PrimaryDark);
        });
    }

    private static void LabeledBox(IContainer container, string label, string value, int minHeight = 60)
    {
        container.Element(Box).Padding(8).MinHeight(minHeight).Column(col =>
        {
            col.Item().Text(label.ToUpperInvariant()).FontSize(7.5f).FontColor(TextMuted);
            col.Item().PaddingTop(3).Text(value.Length > 0 ? value : "—").FontSize(9.5f).FontColor(value.Length > 0 ? Text : TextMuted);
        });
    }

    private static void HeaderCell(TableCellDescriptor header, string text) =>
        header.Cell().BorderBottom(1).BorderColor(Border).PaddingBottom(3)
            .Text(text.ToUpperInvariant()).FontSize(8).Bold().FontColor(TextMuted);

    private static void BodyCell(TableDescriptor table, string text) =>
        table.Cell().BorderBottom(0.5f).BorderColor(Border).PaddingVertical(3)
            .Text(text.Length > 0 ? text : "—").FontSize(9);

    private static void Footer(IContainer container) =>
        container.AlignCenter().Text(text =>
        {
            text.DefaultTextStyle(x => x.FontSize(7.5f).FontColor(TextMuted).Italic());
            text.Span("DnD Session Manager — Character Sheet Export · Page ");
            text.CurrentPageNumber();
            text.Span(" of ");
            text.TotalPages();
        });

    private static IContainer Box(IContainer container) =>
        container.Background(Surface).Border(1).BorderColor(Border).CornerRadius(4);

    private (string Name, int Score)[] Abilities() =>
    [
        ("Strength", character.Strength),
        ("Dexterity", character.Dexterity),
        ("Constitution", character.Constitution),
        ("Intelligence", character.Intelligence),
        ("Wisdom", character.Wisdom),
        ("Charisma", character.Charisma),
    ];

    private int AbilityScore(string ability) => ability switch
    {
        "Strength" => character.Strength,
        "Dexterity" => character.Dexterity,
        "Constitution" => character.Constitution,
        "Intelligence" => character.Intelligence,
        "Wisdom" => character.Wisdom,
        "Charisma" => character.Charisma,
        _ => 10,
    };

    private static string AbilityAbbrev(string ability) => ability switch
    {
        "Strength" => "STR",
        "Dexterity" => "DEX",
        "Constitution" => "CON",
        "Intelligence" => "INT",
        "Wisdom" => "WIS",
        "Charisma" => "CHA",
        _ => ability,
    };

    private static int ProficiencyBonus(LevelSheetDetailDto? sheet) => sheet?.ProficiencyBonus ?? 2;
    // House rule (confirmed with the DM, deviates from RAW): above 10, standard
    // 5e pairing (every 2 points = +1). Below 10, a full -1 per point instead of
    // per 2 — low stats hurt more at this table. 9=-1, 8=-2, 7=-3, 6=-4, etc.
    private static int Modifier(int score) => score >= 10 ? (int)Math.Floor((score - 10) / 2.0) : score - 10;
    private static string FmtMod(int mod) => mod >= 0 ? $"+{mod}" : mod.ToString();
    private static string Fallback(string value) => value.Length > 0 ? value : "—";
    private static string Dots(int filled, int total) => string.Concat(Enumerable.Range(0, total).Select(i => i < filled ? "● " : "○ "));
}
