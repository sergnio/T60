
const recommended = ["pikachu", "bulbasaur", "charmander", "squirtle"]

function App() {

    return (
        <div className='flex flex-col gap-4 w-screen h-screen bg-amber-100 border rounded-md border-amber-700 text-black p-4 items-center justify-center' >
            <div className='flex flex-col gap-2'>
                <h1 className="text-4xl font-bold">Hello from itsuki!</h1>
                <h2 className="font-semibold">My Favorite Pokemons</h2>
                <div className="antialiased relative w-full flex flex-row gap-2">
                    {recommended.map((pokemon) => (
                        <div
                            className="border rounded-md border-black bg-white py-1 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            key={pokemon}
                        >{pokemon == "pikachu" ? `⭐ ${pokemon} ⭐` : pokemon}</div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default App
