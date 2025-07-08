class Party:
    def __init__(self, party_id: str):
        self.party_id = party_id
        self.players = set()
        self.messages = []
