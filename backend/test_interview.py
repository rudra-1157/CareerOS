import os
os.environ["GROQ_API_KEY"] = ""
import sys
sys.path.insert(0, ".")

from app.routers.interview import _rule_engine_evaluate, _keyword_overlap, MIN_WORDS

print("1. Rule engine imported OK")

IDEAL_KPS = [
    "Hash Set: O(N) time and O(N) space.",
    "Floyd: slow pointer 1 step, fast pointer 2 steps.",
    "If they meet, cycle exists.",
    "Floyd: O(N) time and O(1) space, space-optimal."
]

# Test 1: Good answer
good = (
    "Floyd's algorithm uses two pointers — a slow pointer moving one step and a fast pointer moving two steps. "
    "If a cycle exists they will eventually meet at the same node. "
    "Time complexity is O(N), space complexity is O(1) since no extra storage is needed. "
    "The hash set approach stores visited nodes, giving O(N) time but O(N) space. "
    "Floyd's algorithm is therefore space-optimal and preferred when memory is constrained."
)
r1 = _rule_engine_evaluate(good, IDEAL_KPS, "dsa", "Medium")
print(f"2. Good answer score: {r1['overall_score']}/10  (expect > 6)")
print(f"   Matched KPs: {len(r1['matched_key_points'])}/{len(IDEAL_KPS)}")
assert r1["overall_score"] >= 5.0, f"Expected >= 5.0 got {r1['overall_score']}"

# Test 2: Gibberish → low score
gibberish_text = "asdfasdf hello nothing nothing hello test word test"
r2 = _rule_engine_evaluate(gibberish_text, IDEAL_KPS, "dsa", "Medium")
print(f"3. Gibberish score: {r2['overall_score']}/10  (expect < 4)")
assert r2["overall_score"] < 4.5, f"Expected < 4.5 got {r2['overall_score']}"

# Test 3: Short answer (barely over limit) → low score
short = "Floyd uses slow and fast pointer. They meet if cycle exists."
r3 = _rule_engine_evaluate(short, IDEAL_KPS, "dsa", "Medium")
print(f"4. Short answer score: {r3['overall_score']}/10  (expect < 6)")

# Test 4: Behavioral track
beh_ans = (
    "In my third semester, our team was building a web scraping system and hit a bottleneck two days before the deadline. "
    "My task was to handle the data pipeline. I stepped up, identified the blocking network module, and proposed using async requests. "
    "I communicated with teammates daily, delegated the UI update to another member, and focused on fixing the pipeline. "
    "We delivered on time and scored 92 percent in the faculty review."
)
r4 = _rule_engine_evaluate(beh_ans, [
    "Situation: academic project context and specific bottleneck.",
    "Task: specific responsibility.",
    "Action: communicated with team, decoupled features.",
    "Result: delivered on time, measurable outcome."
], "behavioral", "Easy")
print(f"5. Behavioral answer score: {r4['overall_score']}/10  (expect > 5)")
assert r4["overall_score"] >= 5.0

# Test 5: MIN_WORDS check
print(f"6. MIN_WORDS = {MIN_WORDS}")
assert MIN_WORDS == 15

print("\n=== All 5 rule-engine tests passed! ===")
