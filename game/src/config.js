// Shared constants for The Gilded Vault: canvas size, HUD height, speeds,
// detection ranges and alarm rates. Room coordinates run 0..960 by 0..640 and
// are drawn below the HUD bar, so every room y is offset by HUD_H on screen.
export const CANVAS_W = 960;
export const CANVAS_H = 704;
export const HUD_H = 64;
export const ROOM_W = 960;
export const ROOM_H = 640;

export const THIEF_RADIUS = 11;
export const THIEF_WALK_SPEED = 150;
export const THIEF_SNEAK_SPEED = 82;
export const THIEF_RUN_SPEED = 205;

export const GUARD_RADIUS = 12;
export const GUARD_PATROL_SPEED = 62;
export const GUARD_CHASE_SPEED = 118;
export const GUARD_CONE_RANGE = 185;
export const GUARD_CONE_HALF_ANGLE = 0.52;
export const GUARD_SUSPICION_RISE = 1.15;
export const GUARD_SUSPICION_FALL = 0.5;

export const CAMERA_CONE_RANGE = 205;
export const CAMERA_CONE_HALF_ANGLE = 0.42;
export const CAMERA_ALARM_RATE = 26;

export const ALARM_DECAY = 2.5;
export const ALARM_GUARD_RATE = 16;
export const ALARM_MAX = 100;
export const ALARM_CAUGHT_AT = 100;

export const DIAMOND_CHANNEL_SECONDS = 1.6;
export const SMOKE_RADIUS = 78;
export const SMOKE_SECONDS = 6;
export const EMP_SECONDS = 8;
export const EMP_ALARM_COST = 8;

export const DIAMOND_VALUE = 500;
export const SMALL_LOOT_VALUE = 120;
export const LEVEL_TIME_BONUS = 300;
