from os import listdir, environ
import requests
from os.path import isfile, join
import requests
from bs4 import BeautifulSoup
import json
from dotenv import load_dotenv
import boto3
import argparse

s3 = boto3.client("s3")



def scrape_nodes_and_portraits(mode):
    standard_url = "https://masteringruneterra.com/wp-content/plugins/deck-viewer/resource/meta-data.json"
    eternal_url = "https://masteringruneterra.com/wp-content/plugins/deck-viewer/resource/eternal-meta-data.json"
    url = eternal_url if mode == "eternal" else standard_url
    response = requests.get(url)
    print("response", response)
    input_data = response.json()
    # with open("data/eternal-meta-data.json", "r") as f:
    #     input_data = json.load(f)
    input_data = input_data["stats"]["three"]["americas"]

    top_15 = input_data[:15]
    output = []

    def parse_rate(rate):
        return round(rate / 100, 4)

    def parse_data(i, data):
        ans = {"label": data["archetype"],
               'assets': data['assets'],
               "id": f"n{i}",
               "play_rate": parse_rate(data["playrate"]),
               "win_rate": parse_rate(data["winrate"]),
               "games_played": data["total_matches"]
               }
        return ans

    parsed_data = [parse_data(i, data) for i, data in enumerate(top_15)]

    json_data = json.dumps(parsed_data)
    s3.put_object(Bucket="lor-meta", Key=f"{mode}/nodes.json", Body=json_data)

    def get_already_seen():
        paginator = s3.get_paginator('list_objects_v2')
        already_seen = set()
        for page in paginator.paginate(Bucket="wtm-assets-dev", Prefix="champion-icons"):
            for obj in page['Contents']:
                already_seen.add(obj["Key"])
        return already_seen

        # path = "data/images/champion_portraits"
        # only_files = [f for f in listdir(path) if isfile(join(path, f))]
        # champion_codes = [f.split(".")[0] for f in only_files]
        # return champion_codes

    already_seen = get_already_seen()

    def download_portrait(champion):
        champion_code = champion[1]
        if champion_code in already_seen:
            return
        url = f"https://masteringruneterra.com/wp-content/plugins/deck-viewer/assets/images/champions/{champion_code}.webp"
        res = requests.get(url)
        s3.put_object(Bucket="wtm-assets-dev", Key=f"champion-icons/{champion_code}.webp", Body=res.content)
        already_seen.add(champion_code)

    for data in parsed_data:
        for champion in data["assets"]["champions"]:
            download_portrait(champion)


def scrape_edges(mode):
    standard_url = "https://masteringruneterra.com/mu-table/"
    eternal_url = "https://masteringruneterra.com/eternal-mu-table/"
    url = eternal_url if mode == "eternal" else standard_url
    page = requests.get(url)

    soup = BeautifulSoup(page.content, 'html.parser')

    headers = soup.select("div.grid-item.side-header")
    headers = map(lambda x: x.text.strip(), headers)
    decks = list(headers)

    def handleWinrate(winRate: str) -> str:
        winRate = winRate[:-1]  # dropping %
        winRate = float(winRate)
        winRate = winRate / 100
        winRate = round(winRate, 4)
        return winRate

    cells = soup.select(".versus-cell > div")
    rawText = map(lambda x: x.text.strip(), cells)

    def get_win_rate(text):
        winRate = text.strip()
        # handing winrate
        winRate = handleWinrate(winRate)

        return {"winRate": winRate}

    matchUps = list(map(get_win_rate, rawText))
    matchUps[0:10]

    table = {key: {} for key in decks}
    NUM_ROWS = 15
    # getting number of columns
    column_headers = soup.select(".grid-container top-grid")
    NUM_COLUMNS = len(column_headers)
    NUM_COLUMNS_TO_GET = 15
    rows = list(soup.select_one("div.mu-table-container").children)

    for i in range(NUM_ROWS):
        row = list(rows[i].children)
        for j in range(NUM_COLUMNS_TO_GET):
            deck1 = decks[i]
            deck2 = decks[j]
            if i == j:  # diagonal on the match up, the deck is playing itself
                table[deck1][deck2] = {"win_rate": 0.5, "games_played": 10000}
                continue
            cell = row[j]
            mu = get_win_rate(cell.text)
            table[deck1][deck2] = {"win_rate": mu["winRate"]}

    deckCells = soup.select(".grid-container:not(:first-child):not(:last-child) > .grid-item.side-header")
    len(deckCells)
    from dataclasses import dataclass, asdict

    @dataclass
    class Archetype:
        name: str

    def parseDeckCell(deckCell):
        children = list(deckCell.childGenerator())
        children = [child.text for child in children]
        name = children[0]

        ans = Archetype(name)
        return ans

    archeTypes = [parseDeckCell(cell) for cell in deckCells]
    import json

    nameToId = {deck.name: f"n{i}" for i, deck in enumerate(archeTypes)}
    i = 0
    edgeList = []
    for playingDeck, opposingDecks in table.items():
        for opposingDeck, data in opposingDecks.items():
            thisEdge = {"id": f"e{i}", "source": nameToId[playingDeck], "target": nameToId[opposingDeck],
                        "win_rate": data["win_rate"]}
            edgeList.append(thisEdge)
            i += 1

    edge_json = json.dumps(edgeList)
    s3.put_object(Bucket="lor-meta", Key=f"{mode}/edges.json", Body=edge_json)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["standard", "eternal"])
    args = parser.parse_args()
    mode = args.mode

    scrape_nodes_and_portraits(mode)
    scrape_edges(mode)
