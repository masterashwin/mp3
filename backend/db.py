from sqlalchemy import create_engine, Column, Integer, Float, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_URL = "sqlite:///music.db"

engine = create_engine(DB_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String)
    title = Column(String)
    artist = Column(String)
    duration_sec = Column(Float)
    bitrate_claimed_kbps = Column(Integer)
    cutoff_khz = Column(Float)
    confidence = Column(Float)
    loudness_lufs = Column(Float)
    lyrics = Column(String, nullable=True)  

    # Expand later:
    bpm = Column(Float, nullable=True)
    key = Column(String, nullable=True)
    genre_predicted = Column(String, nullable=True)
    instrument_tags = Column(JSON, nullable=True)
    lyrics_themes = Column(JSON, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)
