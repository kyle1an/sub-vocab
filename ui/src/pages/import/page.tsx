export function AboutPage() {
  return (
    <main>
      <div className="py-6">
        <div className="flex">
          Data provided by&nbsp;
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://www.themoviedb.org/"
          >
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
              className="h-8"
            />
          </a>
        </div>
        This project uses the TMDB API but is not endorsed or certified by TMDB.
      </div>
    </main>
  )
}
