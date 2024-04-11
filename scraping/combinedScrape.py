from os import listdir, environ
import requests
from os.path import isfile, join
import requests
from bs4 import BeautifulSoup
import json
from dotenv import load_dotenv




def scrape_nodes_and_portraits(mode):
    standard_url = "https://masteringruneterra.com/wp-content/plugins/deck-viewer/resource/meta-data.json"
    eternal_url = "https://masteringruneterra.com/wp-content/plugins/deck-viewer/resource/eternal-meta-stats.json"
    url = eternal_url if mode == "eternal" else standard_url
    response = requests.get(url)
    print("response", response)
    input_data = response.json()
    # with open("data/eternal-meta-data.json", "r") as f:
    #     input_data = json.load(f)
    input_data = input_data["stats"]["seven"]["americas"]

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

    with open("data/nodes.json", "w") as f:
        json.dump(parsed_data, f)

    def get_already_seen():
        path = "data/images/champion_portraits"
        only_files = [f for f in listdir(path) if isfile(join(path, f))]
        champion_codes = [f.split(".")[0] for f in only_files]
        return champion_codes

    already_seen = set(get_already_seen())

    def download_portrait(champion):
        champion_code = champion[1]
        if champion_code in already_seen:
            return
        url = f"https://masteringruneterra.com/wp-content/plugins/deck-viewer/assets/images/champions/{champion_code}.webp"
        res = requests.get(url)
        with open(f"data/images/champion_portraits/{champion_code}.webp", "wb") as f:
            f.write(res.content)
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

    headers = soup.select("div.grid-item:not(.versus-cell)")
    headers = map(lambda x: x.text.strip(), headers)
    decks = list(headers)[1:16]
    print(len(decks))
    print(decks)

    def handleWinrate(winRate: str) -> str:
        winRate = winRate[:-1]  # dropping %
        winRate = float(winRate)
        winRate = winRate / 100
        winRate = round(winRate, 4)
        return winRate

    cells = soup.select(".versus-cell > div")
    rawText = map(lambda x: x.text.strip(), cells)

    def getWinRateAndGames(text):
        winRate, games = text.split("\n");
        # handing winrate
        winRate = handleWinrate(winRate)

        # handling games
        games = games.split(" ")[1]
        games = int(games)
        return {"winRate": winRate, "gamesPlayed": games}

    matchUps = list(map(getWinRateAndGames, rawText))
    matchUps[0:10]

    table = {key: {} for key in decks}
    muIndex = 0
    for rawIndex in range(len(decks) * len(decks)):
        i = rawIndex // 15
        j = rawIndex % 15
        deck1 = decks[i]
        deck2 = decks[j]
        if i == j:  # diagonal on the match up, the deck is playing itself
            table[deck1][deck2] = {"win_rate": 0.5, "games_played": 10000}
            continue
        mu = matchUps[muIndex]
        muIndex += 1
        table[deck1][deck2] = {"win_rate": mu["winRate"], "games_played": mu["gamesPlayed"]}
    print(table)

    deckCells = soup.select(".grid-container:not(:first-child):not(:last-child) > .grid-item.side-header:first-child")
    len(deckCells)
    from dataclasses import dataclass, asdict

    @dataclass
    class Archetype:
        name: str
        games_played: int
        win_rate: float
        play_rate: float

    def parseDeckCell(deckCell):
        children = list(deckCell.childGenerator())
        children = [child.text for child in children]
        name = children[0]

        games_played = children[1].split(" ")[1]
        games_played = int(games_played)

        win_rate = children[2].split(" ")[1]
        win_rate = handleWinrate(win_rate)

        play_rate = children[4].split(" ")[1]
        play_rate = handleWinrate(play_rate)

        ans = Archetype(name, games_played, win_rate, play_rate)
        return ans

    archeTypes = [parseDeckCell(cell) for cell in deckCells]
    import json
    # output = [{"id": f"n{i}", "label": deck.name} for i, deck in enumerate(archeTypes)]
    # with open("data/nodes.json", "w") as f:
    #     json.dump(output, f, indent=4)

    nameToId = {deck.name: f"n{i}" for i, deck in enumerate(archeTypes)}
    i = 0
    edgeList = []
    for playingDeck, opposingDecks in table.items():
        for opposingDeck, data in opposingDecks.items():
            thisEdge = {"id": f"e{i}", "source": nameToId[playingDeck], "target": nameToId[opposingDeck],
                        "win_rate": data["win_rate"], "games_played": data["games_played"]}
            edgeList.append(thisEdge)
            i += 1

    with open("data/edges.json", "w") as f:
        json.dump(edgeList, f)

if __name__ == "__main__":
    scrape_nodes_and_portraits("standard")
    scrape_edges("standard")
