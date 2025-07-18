import random
import string

def generate_random_party_id():
    return ''.join(random.choices(string.ascii_uppercase, k=8))