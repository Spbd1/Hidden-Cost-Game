# Research Notes

## Motivation

The Hidden Cost Game is designed to study how people judge individual choices when important structural constraints are initially hidden. Participants first observe outcomes through an apparently individual-choice frame, then learn that the game assigned unequal hidden healthcare cost conditions.

## Hidden cost manipulation

Participants are assigned to displayed and hidden coverage profiles. The visible experience invites interpretation of treatment choices and outcomes, while the hidden rule reveal later clarifies that structural cost conditions shaped what choices were realistically available.

## Pre/post reveal logic

The study captures judgments before and after the hidden rule reveal:

- Pre-reveal measures record initial attributions, confidence, perceived responsibility, suspicion of constraints, and policy attitudes.
- The reveal explains the hidden cost rule and unequal structural conditions.
- Post-reveal measures record revised attributions, perceived structural impact, perspective change, judgment accuracy, and policy attitudes.

The central comparison is the within-participant shift from pre-reveal to post-reveal judgments.

## Measures

Core measure families include:

- Game behavior: treatment choices, skipped/partial/full care choices, final financial score, final health score, total treatment costs, and total income.
- Attribution and responsibility: initial primary attribution, revised attribution, individual responsibility ratings, and responsibility shift.
- Constraint recognition: suspicion before reveal and perceived structural impact after reveal.
- Protest and policy attitudes: protest legitimacy, rule correction support, redistribution support, and changes in those attitudes.
- Participant background: demographic and contextual variables such as age group, gender, subjective economic status, medical cost pressure, healthcare coverage, and institutional trust.

## Computed metrics

Computed metrics summarize analysis-ready outcomes, including:

- `burden` — experienced financial/health burden from the game.
- `careAvoidance` — tendency to skip or reduce care.
- `responsibilityShift` — change in responsibility judgment after the reveal.
- `constraintRecognitionShift` — change in recognition of structural constraints.
- `protestLegitimacyShift` — change in perceived legitimacy of protest.
- `ruleCorrectionSupportShift` — change in support for correcting the rules.
- `redistributionSupportShift` — change in redistributive support.
- `certaintyCorrection`, `informationCaution`, and `perspectiveChange` — additional post-reveal interpretation and reflection measures.

## Ethics and limitations

- Participation should be voluntary and based on clear consent language.
- Avoid collecting directly identifying information unless your approved protocol requires it.
- Explain that the scenario is a simplified simulation and not medical or financial advice.
- The manipulation can reveal unequal constraints after participants have already made judgments; debriefing language should be clear and non-shaming.
- Online samples may not represent the target population, and game behavior may not generalize to real healthcare decisions.
- Treat incomplete sessions carefully. They may reflect attrition, confusion, technical issues, or refusal to submit.

## Recommended pilot procedure

1. Run an internal technical pilot with test submissions enabled.
2. Verify consent flow, completion flow, `/api/health`, `/admin`, CSV export, JSON export, and backups.
3. Remove test submissions only after backing up and verifying ids.
4. Run a small participant pilot to estimate completion time, attrition, item clarity, and whether the hidden rule reveal is understandable.
5. Inspect distributions for assignment balance, incomplete submissions, extreme response patterns, and missing data.
6. Freeze the consent version, schema version, and analysis plan before collecting the main sample.

## Contact and collaboration

This project is maintained by Dr. Mohammad Moradi.

- Email: dr.moradi@gmail.com
- LinkedIn: https://www.linkedin.com/in/mohammad-moradik/

Thoughtful feedback, methodological suggestions, replication ideas, and collaboration inquiries are very welcome. If you are interested in the project or have comments on the study design, please feel free to get in touch.
