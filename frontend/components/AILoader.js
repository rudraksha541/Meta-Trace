import React from 'react';
import styled from 'styled-components';

const AILoader = () => {
  return (
    <StyledWrapper>
      <div className="loading">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loading {
   --speed-of-animation: 0.9s;
   --gap: 6px;
   --first-color: #d7452c;
   --second-color: #bf3e27;
   --third-color: #a73622;
   --fourth-color: #8f2e1d;
   --fifth-color: #782719;
   display: flex;
   justify-content: center;
   align-items: center;
   width: 100px;
   gap: 6px;
   height: 100px;
  }

  .loading span {
   width: 4px;
   height: 50px;
   background: var(--first-color);
   animation: scale var(--speed-of-animation) ease-in-out infinite;
  }

  .loading span:nth-child(2) {
   background: var(--second-color);
   animation-delay: -0.8s;
  }

  .loading span:nth-child(3) {
   background: var(--third-color);
   animation-delay: -0.7s;
  }

  .loading span:nth-child(4) {
   background: var(--fourth-color);
   animation-delay: -0.6s;
  }

  .loading span:nth-child(5) {
   background: var(--fifth-color);
   animation-delay: -0.5s;
  }

  @keyframes scale {
   0%, 40%, 100% {
    transform: scaleY(0.05);
   }

   20% {
    transform: scaleY(1);
   }
  }`;

export default AILoader;
