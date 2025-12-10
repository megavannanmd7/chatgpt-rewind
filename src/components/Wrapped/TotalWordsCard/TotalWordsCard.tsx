import { FileText } from "lucide-react";
import NeonCardBase from "../NeonCardBase/NeonCardBase";
import "./TotalWordsCard.css";

interface Props {
  totalWords: number;
  totalCharacters: number;
}

export default function TotalWordsCard({ totalWords, totalCharacters }: Props) {
  const valWords = totalWords || 0;
  const valChars = totalCharacters || 0;

  const formattedWords = valWords.toLocaleString();
  const formattedChars = valChars.toLocaleString();

  const getFunFact = (chars: number) => {
if (chars > 5000000) 
  return "You've typed more words than most people speak in an entire year. 🧠💬";

if (chars > 3000000) 
  return "That’s more text than all Harry Potter books *combined* (yes, really). ✨📚";

if (chars > 1500000) 
  return "Enough text to fill a college textbook — or several, actually. 🎓📘";

if (chars > 1000000) 
  return "You've written more data than the first NASA Mars rover transmitted back home. 🚀🛰️";

if (chars > 500000) 
  return "Equivalent to typing the entire Lord of the Rings trilogy. One-handed. Probably. 💍📖";

if (chars > 200000) 
  return "That's the length of a full sci-fi novel. You basically wrote a book this year. ✍️📗";

if (chars > 50000) 
  return "Enough words to fill a university research paper. Your professor would be proud. 🎓📝";

if (chars > 10000) 
  return "That’s the length of a passionate rant on Reddit. Respect. 😂📄";

return "Every character counts! You're building your own knowledge universe. 🌌";

  };

  return (
    <NeonCardBase className="twc-base">
      
      {/* Header Icon */}
      <div className="twc-icon-box">
        <FileText size={32} className="twc-icon" />
      </div>

      <h3 className="twc-label-small">YOU TYPED</h3>

      {/* Main Stat: Tokens/Words */}
      <div className="twc-stat-group">
        <h1 className="twc-hero-number">{formattedWords}</h1>
        <span className="twc-unit">approx. tokens</span>
      </div>

      <div className="twc-divider" />

      {/* Secondary Stat: Characters */}
      <div className="twc-stat-group secondary">
        <h2 className="twc-sub-number">{formattedChars}</h2>
        <span className="twc-unit">total characters</span>
      </div>

      {/* Fun Fact Footer */}
      <div className="twc-footer">
        <p className="twc-fact">
          {getFunFact(valChars)}
        </p>
      </div>

    </NeonCardBase>
  );
}