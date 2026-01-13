import { Link } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { sections } from '../../data/sections';

export default function Header() {
  const { getOverallProgress } = useProgress();

  const sectionInfo = sections.map(s => ({
    id: s.id,
    problemCount: s.problems.length,
  }));

  const overallProgress = getOverallProgress(sectionInfo);

  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ML</span>
            </div>
            <span className="text-xl font-semibold text-white">ML Interview Prep</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-dark-300 text-sm">Overall Progress</span>
              <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-primary-400 text-sm font-medium">{overallProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
