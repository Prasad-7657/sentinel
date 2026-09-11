import math
from collections import Counter


def calculate_entropy(value):
    if not value:
        return 0.0

    counts = Counter(value)
    length = len(value)

    entropy = -sum(
        (count / length) * math.log2(count / length)
        for count in counts.values()
    )

    return round(entropy, 2)
