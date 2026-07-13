from typing import Optional

from app.models.achievement import Achievement, AchievementCategory
from app.models.user import Stage, User

STAGE_THRESHOLDS: dict[Stage, int] = {
    Stage.starter: 0,
    Stage.builder: 300,
    Stage.brand: 700,
    Stage.investor_ready: 1500,
}

STAGE_ORDER: list[Stage] = [
    Stage.starter,
    Stage.builder,
    Stage.brand,
    Stage.investor_ready,
]

STAGE_GATES: dict[Stage, str] = {
    Stage.builder: "Domain registration",
    Stage.brand: "Professional email",
    Stage.investor_ready: "Full business suite",
}


def next_stage(current: Stage) -> Optional[Stage]:
    idx = STAGE_ORDER.index(current)
    if idx + 1 >= len(STAGE_ORDER):
        return None
    return STAGE_ORDER[idx + 1]


def award_xp(user: User, xp: int) -> list[Achievement]:
    user.xp_total += xp
    milestones: list[Achievement] = []

    for stage in STAGE_ORDER[1:]:
        if user.stage == STAGE_ORDER[STAGE_ORDER.index(stage) - 1]:
            if user.xp_total >= STAGE_THRESHOLDS[stage]:
                user.stage = stage
                gate = STAGE_GATES[stage]
                milestones.append(
                    Achievement(
                        user_id=user.user_id,
                        title=f"Reached {stage.value.replace('_', '-').title()} Stage",
                        impact=f"Unlocked {stage.value.replace('_', ' ').title()} stage · {gate} unlocked",
                        category=AchievementCategory.stage_milestone,
                    )
                )

    return milestones
