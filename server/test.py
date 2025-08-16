import asyncio

async def test():
    await asyncio.sleep(10)
    print('world')

def main():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(test())
    print('hello')
    loop.run_until_complete(asyncio.sleep(11))
    print('xD')
    loop.close()

main()