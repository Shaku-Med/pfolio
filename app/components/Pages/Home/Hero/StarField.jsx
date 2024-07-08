'use client'
import React, { useEffect, useRef } from 'react';

const StarField = ({gid}) => {
  const canvasRef = useRef(null);
  const numStars = 3000;
  const speed = 5;
  const maxDepth = 1500;
  const starColors = ["#FFFFFF", "#FFDDC1", "#FFC0CB", "#121212", "#B0E0E6"];
  let stars = [];
  let mouseX = 0;
  let mouseY = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function setCanvasSize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function getRandomColor() {
      return starColors[Math.floor(Math.random() * starColors.length)];
    }

    class Star {
      constructor(x, y, z, size, color) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = size;
        this.color = color;
      }

      update() {
        this.z -= speed * (2 - this.z / maxDepth);
        if (this.z <= 0) {
          this.reset();
        }
      }

      reset() {
        this.z = maxDepth;
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.sqrt(Math.random()) * (canvas.width / 2);
        this.x = Math.cos(angle) * distance;
        this.y = Math.sin(angle) * distance;
        this.size = (1 - distance / (canvas.width / 2)) * 0.1 + 0.5;
        this.color = getRandomColor();
      }

      draw() {
        const x = ((this.x - mouseX) / this.z) * canvas.width + canvas.width / 2;
        const y = ((this.y - mouseY) / this.z) * canvas.height + canvas.height / 2;
        const radius = (1 - this.z / maxDepth) * this.size * 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function initStars() {
      stars = Array.from({ length: numStars }, () => {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.sqrt(Math.random()) * (canvas.width / 2);
        return new Star(
          Math.cos(angle) * distance,
          Math.sin(angle) * distance,
          Math.random() * maxDepth,
          (1 - distance / (canvas.width / 2)) * 0.1 + 0.5,
          getRandomColor()
        );
      });
    }

    function updateAndDrawStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.update();
        star.draw();
      });
      requestAnimationFrame(updateAndDrawStars);
    }

    function handleMouseMove(event) {
      mouseX = (event.clientX / canvas.width) * 2 - 1;
      mouseY = (event.clientY / canvas.height) * 2 - 1;
    }

    window.addEventListener('resize', setCanvasSize);
    window.addEventListener('mousemove', handleMouseMove);

    setCanvasSize();
    initStars();
    requestAnimationFrame(updateAndDrawStars);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} id={gid} />;
};

export default StarField;