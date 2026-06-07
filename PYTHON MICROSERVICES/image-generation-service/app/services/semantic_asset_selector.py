import os


def select_assets(prompt: str):

    prompt = prompt.lower()

    selected_assets = []

    if "war" in prompt or "conflict" in prompt:
        selected_assets.append("assets/war")

    if "food" in prompt or "hunger" in prompt:
        selected_assets.append("assets/hunger")

    if "economy" in prompt or "price" in prompt:
        selected_assets.append("assets/economy")

    return selected_assets