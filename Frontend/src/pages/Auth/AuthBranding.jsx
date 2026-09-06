export default function AuthBranding() {
  return (
    <div className="auth-branding">
      <div className="branding-decoration branding-decoration-one" />
      <div className="branding-decoration branding-decoration-two" />
      <div className="branding-decoration branding-decoration-three" />

      <div className="auth-branding-content">
        <div className="auth-brand">
          <div className="auth-brand-logo">📖</div>

          <div className="auth-brand-name">
            <span>Cha</span>-Read
          </div>
        </div>

        <div className="auth-hero-text">

          <h2>
            Bridging literary
            <span> tradition </span>
            and intelligence.
          </h2>

          <p>
            Discover a collaborative space where books meet AI.
            Curate your personal library, exchange ideas, and
            explore new perspectives with a community of readers.
          </p>
        </div>

        <div className="branding-features">
          <div className="branding-feature">
            <div className="branding-feature-icon">📚</div>

            <div>
              <strong>Curate your library</strong>
              <span>Keep your favorite books close.</span>
            </div>
          </div>

          <div className="branding-feature">
            <div className="branding-feature-icon">✨</div>

            <div>
              <strong>Meet intelligent ideas</strong>
              <span>Explore books with AI-powered tools.</span>
            </div>
          </div>
        </div>

        <div className="auth-social-proof">
          <div className="auth-avatars">
            {['A', 'B', 'C'].map((letter, index) => (
              <div
                key={letter}
                className="avatar avatar-sm"
                style={{
                  marginLeft: index > 0 ? '-9px' : '0',
                  zIndex: 3 - index,
                }}
              >
                {letter}
              </div>
            ))}

            <div
              className="avatar avatar-sm avatar-more"
              style={{
                marginLeft: '-9px',
                zIndex: 0,
              }}
            >
              +24
            </div>
          </div>

          <div className="auth-community-text">
            <strong>Growing community</strong>
            <span>Readers are exploring together</span>
          </div>
        </div>

       
      </div>
    </div>
  )
}