import { Layers, MessageSquare } from "lucide-react";
import NeonCardBase from "../NeonCardBase/NeonCardBase";
import "./TotalConversationsCard.css";

interface Convo {
  title: string;
  messageCount: number;
}

interface Props {
  convos: Convo[];
  totalConversations: number;
}

export default function TotalConversationsCard({ convos, totalConversations }: Props) {
  return (
    <NeonCardBase className="tcc-base">
      
      {/* 1. Hero Section: Total Volume */}
      <div className="tcc-hero-section">
        <div className="tcc-icon-circle">
          <Layers size={28} className="tcc-icon" />
        </div>
        <h3 className="tcc-label-small">TOTAL CONVERSATIONS STARTED</h3>
        <h1 className="tcc-hero-number">{totalConversations.toLocaleString()}</h1>
      </div>

      {/* 2. Bridge Text */}
      <p className="tcc-bridge">
        But these 5 went deeper than the rest.
      </p>

      {/* 3. The Deepest 5 List */}
      <div className="tcc-list">
        {convos.slice(0, 5).map((c, i) => (
          // Added 'rank-X' class for medal styling
          <div key={i} className={`tcc-item rank-${i + 1}`}>
            
            {/* Rank Box */}
            <div className="tcc-rank-box">
              <span className="tcc-rank-num">{i + 1}</span>
            </div>
            
            {/* Info */}
            <div className="tcc-info">
              <span className="tcc-name">{c.title}</span>
              <div className="tcc-meta">
                <MessageSquare size={10} />
                <span>{c.messageCount} messages</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </NeonCardBase>
  );
}