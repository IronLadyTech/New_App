"""
Synthesise the launch sound (original — no samples), timed to IronLadyAnimatedSplash:

  launch-intro.wav  0.30 s tick (square appears) · 0.65–1.15 s low grind (extrudes into the block)
                    1.25 s IRON thud · 1.45 s LADY thud (deeper) — each with a short iron ring
  launch-push.wav   rising swell into the block's dark face, releasing as the app appears

    python scripts/build_launch_sound.py
Keep the times below in step with the constants in components/il/IronLadyAnimatedSplash.js.
"""
import os
import wave

import numpy as np

SR = 22050
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'sounds')
rng = np.random.default_rng(7)

SQUARE_AT, EXTRUDE_FROM, EXTRUDE_TO, IRON_AT, LADY_AT = 0.30, 0.65, 1.15, 1.25, 1.45


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be an array (a sweep)."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        a = 1 - np.exp(-2 * np.pi * cutoff[i] / SR)
        acc += a * (v - acc)
        y[i] = acc
    return y


def place(buf, start, sound):
    i = int(start * SR)
    end = min(len(buf), i + len(sound))
    buf[i:end] += sound[: end - i]


def tick():
    t = t_axis(0.06)
    return 0.35 * np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 90) + 0.15 * rng.standard_normal(len(t)) * np.exp(-t * 160)


def grind(seconds):
    t = t_axis(seconds)
    env = np.sin(np.pi * np.clip(t / seconds, 0, 1)) ** 1.5
    noise = lowpass(rng.standard_normal(len(t)), 180 + 900 * (t / seconds))
    sub = np.sin(2 * np.pi * (55 * t + 20 * t * t / seconds))
    return env * (0.5 * noise + 0.45 * sub)


def thud(base, length, ring_gain):
    t = t_axis(length)
    f = base * (1 + 0.8 * np.exp(-t * 18))                    # pitch drops as it lands
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = lowpass(rng.standard_normal(len(t)), 2500) * np.exp(-t * 60) * 0.6
    # iron: a few inharmonic partials, short and quiet
    ring = sum(np.sin(2 * np.pi * p * t) * np.exp(-t * d) for p, d in [(212, 5), (561, 7), (1013, 9), (1647, 12)])
    return 1.0 * body + click + ring_gain * ring / 4


def normalise(x, peak=0.89):
    x = x - np.mean(x)
    return x * (peak / max(1e-9, np.max(np.abs(x))))


def fade(x, fin=0.01, fout=0.12):
    n_in, n_out = int(SR * fin), int(SR * fout)
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def write(name, x):
    os.makedirs(OUT, exist_ok=True)
    data = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print('wrote', name, f'{len(x) / SR:.2f}s')


intro = np.zeros(int(SR * 2.2))
place(intro, SQUARE_AT, tick())
place(intro, EXTRUDE_FROM, 0.55 * grind(EXTRUDE_TO - EXTRUDE_FROM + 0.1))
place(intro, IRON_AT, thud(68, 0.9, 0.35))
place(intro, LADY_AT, 1.1 * thud(52, 1.0, 0.45))
write('launch-intro.wav', fade(normalise(intro)))

t = t_axis(0.85)
swell = np.clip(t / 0.62, 0, 1) ** 2.2 * np.where(t < 0.62, 1, np.exp(-(t - 0.62) * 14))
push = swell * (0.6 * lowpass(rng.standard_normal(len(t)), 300 + 3800 * (t / 0.85)) + 0.5 * np.sin(2 * np.pi * (40 * t + 50 * t * t)))
write('launch-push.wav', fade(normalise(push, 0.8), 0.02, 0.15))
