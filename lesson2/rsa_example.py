p = 773
q = 149

n = p * q

phi = (p-1) * (q-1)

e = 2

def gcd(a, b):
    while a != b:
        if(a > b):
            a -= b
        else:
            b -= a
    return a

while(e < phi):
    if(gcd(e, phi) == 1 and gcd(e, n) == 1):
        break
    e += 1

k = 1

while k * e % phi != 1: k += 1

def encrypt(message):
    return (message ** e) % n

c = encrypt(100)

print(c ** k % n)