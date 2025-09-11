export default function Panel() {
    return (
        <aside
            className="hidden big:flex flex-col p-4 gap-4 w-1/5 border border-transparent border-r-white">
            <label className="border rounded-md bg-black">
                <input
                    type="text"
                    placeholder="🔍 Search user"
                    className="m-auto px-2 w-full cursor-text" />
            </label>
        </aside>
    )
}