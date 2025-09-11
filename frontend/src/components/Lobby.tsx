export default function Lobby() {
    return (
        <div className="big:border rounded-md flex flex-col gap-4 w-full big:w-1/3 p-7 m-auto">
            <h1>
                welcome to
                <br />
                <span className="uppercase text-4xl font-black">
                    gigachat
                </span>
            </h1>
            <p >please, log in</p>
            <label className="border-b-1">
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="m-auto px-2 w-full h-11 cursor-text" />
            </label>
            <label className="border-b-1">
                <input
                    type="password"
                    placeholder="Enter your password"
                    className="m-auto px-2 w-full h-11 cursor-text" />
            </label>

            <button className="border border-red-700 hover:border-white bg-red-700 big:hover:bg-red-900 rounded-md m-auto px-2 h-11 w-full cursor-pointer">
                Log in
            </button>
            <p >need account?</p>
            <a href="/foo" className="border flex items-center justify-center border-red-700 hover:border-white bg-red-700 big:hover:bg-red-900 rounded-md h-11 w-full cursor-pointer">
                Register
            </a>
        </div>
    )
}


