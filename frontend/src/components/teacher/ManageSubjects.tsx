export function ManageSubjects() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold m-0 text-gray-900">Manage Subjects</h2>
                <button className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer border-none" type="button">
                    Create New Subject
                </button>
            </div>
        </div>
    );
}
